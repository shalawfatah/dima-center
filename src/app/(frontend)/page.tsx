import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect a bare root visit automatically to the default English catalog
  redirect('/ckb')
}
