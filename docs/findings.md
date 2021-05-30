# Findings

## Next.JS

- Depending on useRouter causes a component to re-render on route change
    - .push is not stable function
    - <Link> component is not stable because of it.
