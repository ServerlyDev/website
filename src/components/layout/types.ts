export interface NavItem {
  label: string
  icon: string
  to: string
  /** Actif uniquement si l'URL correspond exactement */
  exact?: boolean
  /** Fonctionnalité pas encore disponible */
  soon?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}
