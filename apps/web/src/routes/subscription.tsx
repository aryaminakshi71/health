import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/subscription')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/subscription"!</div>
}
