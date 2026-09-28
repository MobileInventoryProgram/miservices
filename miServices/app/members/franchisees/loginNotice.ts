/** Where a just-created login's temporary password waits (this browser tab only) to be shown once */
export const newLoginKey = (franchiseId: string) => `new-franchise-login:${franchiseId}`;
