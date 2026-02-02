import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { RecaptchaProviderWrapper } from '@/components/layout/recaptcha-provider-wrapper'
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

  // Set NEXT_PUBLIC_DISABLE_RECAPTCHA=true to disable (e.g. when reCAPTCHA causes issues)
  const recaptchaSiteKey =
    process.env.NEXT_PUBLIC_DISABLE_RECAPTCHA === "true"
      ? undefined
      : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  return (
    <RecaptchaProviderWrapper siteKey={recaptchaSiteKey}>
      <PublicLayoutClient isAdmin={isAdmin}>
        <div className="flex min-h-screen flex-col">
          <AnnouncementBar />
          <Header logoSrc={logo.url} logoAlt={logo.alt} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </PublicLayoutClient>
    </RecaptchaProviderWrapper>
  )
}
