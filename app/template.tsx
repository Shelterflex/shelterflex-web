// Remounts on every navigation, so each new screen fades in rather than
// snapping. Opacity only: a transform here would become the containing block
// for the pages' fixed headers and tab bars and make them jump mid-animation.
export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="page-enter">{children}</div>
}
