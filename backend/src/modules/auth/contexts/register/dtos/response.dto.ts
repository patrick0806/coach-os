export class RegisterProfileResponseDTO {
  id: string;
  slug: string;
}

export class RegisterResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: RegisterProfileResponseDTO;
}
