import { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const MultiSelect = ({ label, options, selected, onChange }) => {
    // If selected is null/undefined, default to empty array
    const selectedValues = Array.isArray(selected) ? selected : [];

    const isSelected = (value) => selectedValues.includes(value);

    const handleSelect = (value) => {
        onChange(value);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <Listbox value={selectedValues} onChange={handleSelect} multiple>
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-black sm:text-sm text-gray-900">
                        <span className="block truncate">
                            {selectedValues.length === 0
                                ? 'Seleccionar...'
                                : selectedValues.join(', ')}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-200 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100 text-black' : 'text-gray-900'
                                        }`
                                    }
                                    value={option}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selectedValues.includes(option) ? 'font-medium text-black' : 'font-normal'
                                                    }`}
                                            >
                                                {option}
                                            </span>
                                            {selectedValues.includes(option) ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

export default MultiSelect;
