import { ApplicationRoles } from "@shared/enums";

export class LoginResponseDTO {
  accessToken: string;
  role: ApplicationRoles;
  personalSlug: string | null;
}
