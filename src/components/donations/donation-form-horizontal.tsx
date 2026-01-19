"use client"

import { useState } from "react";
import { DonationModal } from "./donation-modal";

interface DonationFormHorizontalProps {
  className?: string
}

export function DonationFormHorizontal({ className = '' }: DonationFormHorizontalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`flex items-center justify-center ${className}`}>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-lg font-bold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black md:px-10 md:py-4 md:text-xl"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Heart Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 md:h-6 md:w-6"
            aria-hidden="true"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          DONATE TO RISEUP
        </button>
      </div>

      {/* Donation Modal */}
      <DonationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
