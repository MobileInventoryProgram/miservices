# Logins

**Franchise logins:** Members Area → Franchisees → open the franchise → **Members Area logins**.
Add a login, reset a password (a temporary password is shown once to pass on) or switch a login off.
Adding a new franchise can create the owner's login at the same time.

**Head Office admin logins** (role `admin`) aren't created from the Members Area. Create a `member`
document in Sanity Studio with role Admin, then set its password from the Members Area
(Franchisees → Head Office → Reset password), or with a one-off script using `hashPassword` from `lib/auth.ts`.
