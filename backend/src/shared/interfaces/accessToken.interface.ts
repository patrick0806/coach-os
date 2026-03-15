import { ApplicationRoles } from "@shared/enums";

export interface IAccessToken {
  sub: string;                  // users.id
  role: ApplicationRoles;
  profileId: string;            // personals.id | students.id | admins.id
  personalId: string | null;    // tenant context (null only for ADMIN)
  personalSlug: string | null;  // personal's slug — used by STUDENT for redirect
}
