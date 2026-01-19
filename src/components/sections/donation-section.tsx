import { getImageContent } from "@/lib/content/queries"
import { DonationSectionEditable } from "./donation-section-editable"

export async function DonationSection() {
  const flagBackground = await getImageContent("donation.flag_background")

  return (
    <DonationSectionEditable
      initialFlagUrl={flagBackground.url}
      initialFlagAlt={flagBackground.alt}
    />
  )
}
