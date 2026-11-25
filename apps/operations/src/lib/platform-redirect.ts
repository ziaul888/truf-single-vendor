/** Platform sign-in can return only to console routes, never another audience or origin. */
export function platformRedirectPath(from: string | null) {
  if (
    !from ||
    from.includes("\\") ||
    !/^\/platform(?:\/(?:applications|tenants(?:\/(?:new|[0-9a-f-]{36}))?|plans(?:\/new)?|subscriptions|invoices(?:\/[0-9a-f-]{36})?))?(?:\?[^#]*)?$/i.test(
      from
    )
  )
    return "/platform";
  return from;
}
