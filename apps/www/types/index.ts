export type BadgeVariant = "new" | "pro"

export interface NavBadge {
  text: string
  variant: BadgeVariant
}

export interface NavItem {
  title: string
  href?: string
  external?: boolean
  disabled?: boolean
  badge?: NavBadge
}

export interface NavItemWithChildren extends NavItem {
  items?: NavItemWithChildren[]
}
