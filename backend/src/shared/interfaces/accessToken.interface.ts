import { ApplicationRoles } from "@shared/enums";

export interface IAccessToken {
  id: string;
  name: string;
  email: string;
  role: ApplicationRoles;
}
