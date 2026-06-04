import { Head, Link } from '@inertiajs/react';

export default function Welcome({countries}:any) {

    return (
        <>
            <Head title="Welcome" />
            <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center py-4 sm:pt-0">
                Countries:
                {countries.map((country:any) => (
                    <div key={country.id}>
                        {country.name}
                    </div>
                ))}

            </div>

        </>
    );
}
