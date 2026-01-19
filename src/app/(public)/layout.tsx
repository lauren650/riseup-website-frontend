import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { PublicLayoutClient } from './public-layout-client'
import { createClient } from '@/lib/supabase/server'
import { getImageContent } from '@/lib/content/queries'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated admin viewing public pages
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  // Fetch logo content
  const logo = await getImageContent('header.logo')

  return (
    <PublicLayoutClient isAdmin={isAdmin}>
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <Header logoSrc={logo.url} logoAlt={logo.alt} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PublicLayoutClient>
  )
}
