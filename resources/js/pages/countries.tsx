import { Head } from '@inertiajs/react';
import {
    CaretDownIcon,
    CaretUpDownIcon,
    CaretUpIcon,
    GearIcon,
    ProhibitIcon,
    CheckSquareIcon,
    PlusSquareIcon,
    PencilSimpleLineIcon,
    TrashIcon,
} from '@phosphor-icons/react';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';




type SelectOption = { value: number; label: string };

/* eslint-disable @stylistic/padding-line-between-statements, @stylistic/brace-style, react-hooks/exhaustive-deps */

const CountryTableRow = React.memo(({ country, isSelected, onToggleSelect, onSyncTags, tagOptions, createTag }: {
  country: any;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onSyncTags: (country: any, ids: number[]) => Promise<void>;
  tagOptions: SelectOption[];
  createTag: (name: string) => Promise<any | null>;
}) => (
  <tr className="hover:bg-gray-50">
    <td className="border border-gray-300 px-4 py-2 text-center">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(country.id)}
        id={`select-${country.id}`}
      />
    </td>
    <td className="border border-gray-300 px-4 py-2">
        <label htmlFor={`select-${country.id}`}>{country.name}</label>
    </td>
    <td className="border border-gray-300 px-4 py-2 text-nowrap">
      {country.continent}
    </td>
    <td className="border border-gray-300 px-4 py-2">
      {country.capital}
    </td>
    <td className="border border-gray-300 px-4 py-2">
      <CreatableSelect
        isMulti
        className="text-sm capitalize"
        classNamePrefix="react-select"
        options={tagOptions}
        value={country.tags.map((t: any) => ({
          value: t.id,
          label: t.name,
        }))}
        onChange={async (selected: any) => {
          const ids = (selected || []).map((s: SelectOption) => s.value);
          await onSyncTags(country, ids);
        }}
        onCreateOption={async (inputValue: string) => {
          const created = await createTag(inputValue);
          if (!created) { return; }
          const ids = country.tags.map((t: any) => t.id);
          ids.push(created.id);
          await onSyncTags(country, ids);
        }}
      />
    </td>
  </tr>
));
CountryTableRow.displayName = 'CountryTableRow';

export default function Countries() {
  const [countries, setCountries] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pendingSearch, setPendingSearch] = useState<string>('');
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [filterTagIds, setFilterTagIds] = useState<number[]>([]);
  const [mode, setMode] = useState<'or' | 'and'>('or');
  const [tagModalOpen, setTagModalOpen] = useState<boolean>(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [tagName, setTagName] = useState<string>('');
  const [bulkTagModalOpen, setBulkTagModalOpen] = useState<boolean>(false);
  const [bulkTagValue, setBulkTagValue] = useState<SelectOption | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'capital' | 'continent' | 'tags'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<boolean>(false);

  const searchRef = useRef<string>(search);
  const filterTagIdsRef = useRef<number[]>(filterTagIds);
  const modeRef = useRef<'or' | 'and'>(mode);
  const sortByRef = useRef<'name' | 'capital' | 'continent' | 'tags'>('name');
  const sortDirRef = useRef<'asc' | 'desc'>('asc');
  const searchTagsRef = useRef<boolean>(false);

  // keep refs in sync with state so our stable fetchCountries can read
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    filterTagIdsRef.current = filterTagIds;
  }, [filterTagIds]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    sortDirRef.current = sortDir;
  }, [sortDir]);

  useEffect(() => {
    searchTagsRef.current = searchTags;
  }, [searchTags]);

  const fetchTags = useCallback(async (): Promise<void> => {
    const res = await fetch('/api/tags');
    const json = await res.json();
    setTags(json.data || []);
  }, []);

  const fetchCountries = useCallback(async (opts?: { search?: string; tagIds?: number[]; mode?: 'or' | 'and'; sortBy?: string; sortDir?: string; searchTags?: boolean }) => {
    const params = new URLSearchParams();

    const q = opts?.search ?? searchRef.current;
    if (q) { params.append('search', q); }

    const st = opts?.searchTags ?? searchTagsRef.current;
    if (st) { params.append('search_tags', '1'); }

    const ids = opts?.tagIds ?? filterTagIdsRef.current;
    (ids || []).forEach((id) => params.append('tag_ids[]', String(id)));

    const m = opts?.mode ?? modeRef.current;
    params.append('mode', m);

    const sb = opts?.sortBy ?? sortByRef.current;
    const sd = opts?.sortDir ?? sortDirRef.current;
    params.append('sort_by', sb);
    params.append('sort_dir', sd);

    const res = await fetch('/api/countries?' + params.toString());
    const json = await res.json();
    setCountries(json.data || []);
  }, []);

  const initRanRef = useRef(false);
  useEffect(() => {
    if (initRanRef.current) { return; }
    initRanRef.current = true;
    (async function init() {
      await fetchTags();
      await fetchCountries();
    })();
  }, [fetchTags, fetchCountries]);

  // Note: fetching is handled by the debounced effect below which watches
  // pendingSearch, filterTagIds, mode and sort options.

  function resetFilters(): void {
    // clear UI state
    setSearch('');
    setFilterTagIds([]);
    setMode('or');
    setSelected({});
    setPendingSearch('');
    setShowSelectedOnly(false);
    setSearchTags(false);
  }

  // Debounce fetching when you search, tag filters, mode or sort change
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      // Use explicit overrides so fetchCountries doesn't rely on the stale refs
      // Note: sortBy/sortDir are applied immediately via header clicks, not debounced
      void fetchCountries({ search: pendingSearch, tagIds: filterTagIds, mode, sortBy, sortDir, searchTags });
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pendingSearch, filterTagIds, mode, searchTags, fetchCountries]);

  const toggleSelect = useCallback((id: number) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  const tagOptions = useMemo<SelectOption[]>(
    () => tags.map((t: any) => ({ value: t.id, label: t.name })),
    [tags],
  );

  const displayedCountries = showSelectedOnly
    ? countries.filter((c: any) => selected[c.id])
    : countries;


  async function applySorting(newSortBy: 'name' | 'capital' | 'continent' | 'tags', defaultDir?: 'asc' | 'desc'): Promise<void> {
    let newSortDir: 'asc' | 'desc' = 'asc';
    // If clicking the same column, toggle direction; otherwise use provided default or asc
    if (sortBy === newSortBy) {
      newSortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else if (defaultDir) {
      newSortDir = defaultDir;
    }
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    // Immediately fetch with new sort params (no debounce)
    await fetchCountries({ search: pendingSearch, tagIds: filterTagIds, mode, sortBy: newSortBy, sortDir: newSortDir });
  }

  async function openEditTag(tag: any | null): Promise<void> {
    setEditingTag(tag);
    setTagName(tag ? tag.name : '');
    setTagModalOpen(true);
  }

  async function saveTag(): Promise<void> {
    const payload = { name: tagName };

    if (editingTag) {
      const res = await fetch('/api/tags/' + editingTag.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });


      if (res.ok) {
        setTagModalOpen(false);
        await fetchTags();
        return;
      }


      alert('Failed to update tag');
      return;
    }

    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });


    if (res.ok) {
      setTagModalOpen(false);
      await fetchTags();
      return;
    }


    alert('Failed to create tag');
  }

  async function deleteTag(tag: any): Promise<void> {
    if (!confirm(`Delete tag "${tag.name}"? This will be removed on all countries.`)) {
      return;
    }


    const res = await fetch('/api/tags/' + tag.id, { method: 'DELETE' });


    if (res.status === 204) {
      await fetchTags();
      return;
    }


    alert('Failed to delete');
  }
  const createTag = useCallback(async (name: string): Promise<any | null> => {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      alert('Failed to create tag');
      return null;
    }

    const json = await res.json();
    const tag = json.data;
    await fetchTags();
    return tag;
  }, [fetchTags]);

  async function applyTagToSelected(tagId: number): Promise<void> {
    const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));

    if (selectedIds.length === 0) {
      alert('No countries selected');
      return;
    }

    // Call server-side bulk attach endpoint
    const res = await fetch(`/api/tags/${tagId}/countries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country_ids: selectedIds }),
    });

    if (!res.ok) {
      alert('Failed to apply tag to selected countries');
      return;
    }

    // Refresh countries and tags to reflect changes
    await fetchCountries();
    await fetchTags();

    setBulkTagModalOpen(false);
    setBulkTagValue(null);
  }

  const syncCountryTags = useCallback(async (country: any, ids: number[]): Promise<void> => {
    const res = await fetch(`/api/countries/${country.id}/tags`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag_ids: ids }),
    });

    if (res.ok) {
      const json = await res.json();
      setCountries((cs: any[]) => cs.map((c: any) => (c.id === country.id ? json.data : c)));
      await fetchTags();
    } else {
      alert('Failed to update country tags');
    }
  }, [fetchTags]);

  return (
      <>
          <Head title="Country Tagger" />
          <div className="flex h-full">
              {/* Left sidebar panel */}
              <div className="flex w-80 shrink-0 flex-col gap-4 border-r p-4">
                  <div>
                      <h1 className="mb-2 text-2xl font-bold">Country Tagger</h1>
                      <h4 className="text-xl font-bold">Filter by tags</h4>
                      {tags.map((t: any) => (
                          <Badge
                              key={t.id}
                              className={`relative  cursor-pointer capitalize mr-1 ${filterTagIds.includes(t.id) ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                              onClick={() => {
                                  setFilterTagIds((ids) =>
                                      ids.includes(t.id)
                                          ? ids.filter((i) => i !== t.id)
                                          : [...ids, t.id],
                                  );
                              }}
                          >
                              {t.name}
                              <span className={"text-gray-400"}>{t.countries_count ?? 0}</span>
                          </Badge>
                      ))}
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="text-sm">Match:</span>
                      <label htmlFor={"and_select"} className={`text-sm ${mode === 'and' ? 'font-medium' : ''}`}>all</label>
                      <input id={"and_select"} type="radio" name="mode" checked={mode === 'and'} onChange={() => setMode('and')} />
                      <label htmlFor={"or_select"} className={`text-sm ${mode === 'or' ? 'font-medium' : ''}`}>any</label>
                      <input id={"or_select"} type="radio" name="mode" checked={mode === 'or'} onChange={() => setMode('or')} />
                  </div>
                  <Button variant="outline" onClick={() => openEditTag(null)}>
                      <GearIcon size={32} />
                      Manage Tags
                  </Button>
              </div>

              {/* Main content */}
              <div className="flex-1 overflow-x-hidden p-6">
                  <div className="mb-4 flex items-center gap-3">
                      <div className={'min-w-150'}>
                          <Input
                              value={pendingSearch}
                              onChange={(e: any) => setPendingSearch(e.target.value)}
                              placeholder={`Search name, continent or capital${searchTags ? ' or tags' : ''} — supports AND / OR`}
                          />
                      </div>
                      <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none whitespace-nowrap">
                          <input
                              type="checkbox"
                              checked={searchTags}
                              onChange={(e) => setSearchTags(e.target.checked)}
                          />
                          Include tags in search
                      </label>
                      <div className="ml-auto flex items-center gap-2">
                          <Button
                              variant="ghost"
                              onClick={resetFilters}
                          >
                              <ProhibitIcon size={32} /> Reset Filters
                          </Button>
                      </div>
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                      <Button
                          variant={showSelectedOnly ? 'default' : 'outline'}
                          onClick={() => setShowSelectedOnly((v) => !v)}
                      >
                          <CheckSquareIcon size={32} weight="fill" />
                          Show selected only
                      </Button>
                      <Button
                          className="ml-2"
                          onClick={() => setBulkTagModalOpen(true)}
                          disabled={
                              Object.values(selected).filter(Boolean).length === 0
                          }
                      >
                          <PlusSquareIcon size={32} /> Add tag to selected
                      </Button>
                  </div>

                  <div className="mb-1 text-right text-sm text-gray-500">
                      {displayedCountries.length}{' '}
                      {displayedCountries.length === 1 ? 'country' : 'countries'}
                  </div>
              <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-100">
                          <tr>
                              <th className="w-12 border border-gray-300 px-4 py-2 text-left text-sm font-semibold">

                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                                  <button
                                      type="button"
                                      className="flex items-center gap-1 hover:text-blue-600"
                                      onClick={() =>
                                          applySorting('name', 'asc')
                                      }
                                  >
                                      Name{' '}
                                      {sortBy === 'name' ? (
                                          sortDir === 'asc' ? (
                                              <CaretUpIcon weight="fill" />
                                          ) : (
                                              <CaretDownIcon weight="fill" />
                                          )
                                      ) : (
                                          <CaretUpDownIcon weight="fill" />
                                      )}
                                  </button>
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                                  <button
                                      type="button"
                                      className="flex items-center gap-1 hover:text-blue-600"
                                      onClick={() =>
                                          applySorting('continent', 'asc')
                                      }
                                  >
                                      Continent{' '}
                                      {sortBy === 'continent' ? (
                                          sortDir === 'asc' ? (
                                              <CaretUpIcon weight="fill" />
                                          ) : (
                                              <CaretDownIcon weight="fill" />
                                          )
                                      ) : (
                                          <CaretUpDownIcon weight="fill" />
                                      )}
                                  </button>
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                                  <button
                                      type="button"
                                      className="flex items-center gap-1 hover:text-blue-600"
                                      onClick={() =>
                                          applySorting('capital', 'asc')
                                      }
                                  >
                                      Capital{' '}
                                      {sortBy === 'capital' ? (
                                          sortDir === 'asc' ? (
                                              <CaretUpIcon weight="fill" />
                                          ) : (
                                              <CaretDownIcon weight="fill" />
                                          )
                                      ) : (
                                          <CaretUpDownIcon weight="fill" />
                                      )}
                                  </button>
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                                  <button
                                      type="button"
                                      className="flex items-center gap-1 hover:text-blue-600"
                                      onClick={() =>
                                          applySorting('tags', 'desc')
                                      }
                                  >
                                      Tags{' '}
                                      {sortBy === 'tags' ? (
                                          sortDir === 'asc' ? (
                                              <CaretUpIcon weight="fill" />
                                          ) : (
                                              <CaretDownIcon weight="fill" />
                                          )
                                      ) : (
                                          <CaretUpDownIcon weight="fill" />
                                      )}
                                  </button>
                              </th>
                          </tr>
                      </thead>
                      <tbody>
                          {displayedCountries.map((c: any) => (
                              <CountryTableRow
                                  key={c.id}
                                  country={c}
                                  isSelected={selected[c.id] ?? false}
                                  onToggleSelect={toggleSelect}
                                  onSyncTags={syncCountryTags}
                                  tagOptions={tagOptions}
                                  createTag={createTag}
                              />
                          ))}
                      </tbody>
                  </table>
              </div>
              </div>
          </div>

          <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
              <DialogContent className="flex max-h-[90vh] flex-col">
                  <DialogHeader>
                      <DialogTitle>
                          {editingTag ? 'Edit Tag' : 'Create Tag'}
                      </DialogTitle>
                  </DialogHeader>

                  <div className="mt-2">
                      <input
                          value={tagName}
                          onChange={(e: any) => setTagName(e.target.value)}
                          className="w-full rounded border px-2 py-1"
                      />
                  </div>

                  <DialogFooter>
                      <div className="flex gap-2">
                          <Button onClick={saveTag}>
                              {editingTag ? 'Save' : 'Create'}
                          </Button>
                          <Button
                              variant="outline"
                              onClick={() => setTagModalOpen(false)}
                          >
                              Cancel
                          </Button>
                      </div>
                  </DialogFooter>

                  <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
                      <h4 className="mb-2 font-semibold">Existing tags</h4>
                      <div className="flex flex-wrap gap-2">
                          {tags.map((t: any) => (
                              <div
                                  key={t.id}
                                  className="flex w-full items-center gap-2 rounded border px-2 py-1"
                              >
                                  <span className="w-full">{t.name}</span>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditTag(t)}
                                  >
                                      <PencilSimpleLineIcon
                                          size={32}
                                          weight="duotone"
                                      />
                                      Edit
                                  </Button>
                                  <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => deleteTag(t)}
                                  >
                                      <TrashIcon size={32} weight="duotone" />
                                      <span className={'sr-only'}>Delete</span>
                                  </Button>
                              </div>
                          ))}
                      </div>
                  </div>
              </DialogContent>
          </Dialog>
          <Dialog open={bulkTagModalOpen} onOpenChange={setBulkTagModalOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Add tag to selected countries</DialogTitle>
                  </DialogHeader>

                  <div className="mt-2">
                      <CreatableSelect
                          className="text-sm"
                          classNamePrefix="react-select"
                          options={tags.map((t: any) => ({
                              value: t.id,
                              label: t.name,
                          }))}
                          value={bulkTagValue}
                          onChange={(v: any) => setBulkTagValue(v)}
                          onCreateOption={async (inputValue: string) => {
                              const created = await createTag(inputValue);
                              if (!created) {
                                  return;
                              }
                              await applyTagToSelected(created.id);
                          }}
                      />
                  </div>

                  <DialogFooter>
                      <div className="flex gap-2">
                          <Button
                              onClick={async () => {
                                  if (!bulkTagValue) {
                                      alert('Please select or create a tag');
                                      return;
                                  }
                                  await applyTagToSelected(bulkTagValue.value);
                              }}
                          >
                              Apply
                          </Button>
                          <Button
                              variant="outline"
                              onClick={() => setBulkTagModalOpen(false)}
                          >
                              Cancel
                          </Button>
                      </div>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </>
  );
}

