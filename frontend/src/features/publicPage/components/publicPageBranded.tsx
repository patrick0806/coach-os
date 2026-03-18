import { Dumbbell } from "lucide-react"

interface PublicPageBrandedProps {
  coachName: string
  coachLogoUrl: string | null
  children: React.ReactNode
}

export function PublicPageBranded({ coachName, coachLogoUrl, children }: PublicPageBrandedProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          {coachLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coachLogoUrl}
              alt={coachName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Dumbbell className="h-7 w-7 text-primary" />
            </div>
          )}
          <p className="text-sm text-muted-foreground">{coachName}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
