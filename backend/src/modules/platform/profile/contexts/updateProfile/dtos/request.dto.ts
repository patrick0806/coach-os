import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileRequestDTO {
  @ApiPropertyOptional({ example: "Personal trainer especializado em emagrecimento" })
  bio?: string;

  @ApiPropertyOptional({ example: "+55 11 99999-9999" })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: ["musculação", "emagrecimento"] })
  specialties?: string[];

  @ApiPropertyOptional({ example: "#FF5733" })
  themeColor?: string;

  @ApiPropertyOptional({ example: "https://example.com/photo.jpg" })
  profilePhoto?: string;

  @ApiPropertyOptional({ example: "https://example.com/logo.png" })
  logoUrl?: string;

  @ApiPropertyOptional({ example: "Transforme seu corpo" })
  lpTitle?: string;

  @ApiPropertyOptional({ example: "Treinamento personalizado para seus objetivos" })
  lpSubtitle?: string;

  @ApiPropertyOptional({ example: "https://example.com/hero.jpg" })
  lpHeroImage?: string;

  @ApiPropertyOptional({ example: "Sobre mim" })
  lpAboutTitle?: string;

  @ApiPropertyOptional({ example: "Sou personal trainer há 10 anos..." })
  lpAboutText?: string;

  @ApiPropertyOptional({ example: "https://example.com/img1.jpg" })
  lpImage1?: string;

  @ApiPropertyOptional({ example: "https://example.com/img2.jpg" })
  lpImage2?: string;

  @ApiPropertyOptional({ example: "https://example.com/img3.jpg" })
  lpImage3?: string;
}
