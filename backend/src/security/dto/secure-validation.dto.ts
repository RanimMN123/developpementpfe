import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  Length, 
  Matches, 
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  Max,
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Décorateur personnalisé pour valider qu'une chaîne ne contient pas de scripts
export function IsNotScript(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotScript',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;
          
          const scriptPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /expression\s*\(/gi,
            /vbscript:/gi,
          ];
          
          return !scriptPatterns.some(pattern => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} ne doit pas contenir de scripts`;
        },
      },
    });
  };
}

// Décorateur pour valider qu'une chaîne ne contient pas d'injection SQL
export function IsNotSqlInjection(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotSqlInjection',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;
          
          const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /(--|\/\*|\*\/|;)/,
            /(\bOR\b|\bAND\b).*(\b=\b|\b<\b|\b>\b)/i,
            /(UNION.*SELECT)/i,
            /(EXEC.*xp_)/i,
          ];
          
          return !sqlPatterns.some(pattern => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contient des caractères non autorisés`;
        },
      },
    });
  };
}

// Décorateur pour nettoyer les chaînes de caractères
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    return value;
  });
}

// DTO sécurisé pour la création d'utilisateur
export class SecureCreateUserDto {
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @Length(5, 254, { message: 'L\'email doit contenir entre 5 et 254 caractères' })
  @IsNotScript({ message: 'L\'email ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'L\'email contient des caractères non autorisés' })
  @Sanitize()
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @Length(8, 128, { message: 'Le mot de passe doit contenir entre 8 et 128 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial' }
  )
  password: string;

  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @Length(2, 100, { message: 'Le nom doit contenir entre 2 et 100 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: 'Le nom ne doit contenir que des lettres, espaces, apostrophes et tirets' })
  @IsNotScript({ message: 'Le nom ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'Le nom contient des caractères non autorisés' })
  @Sanitize()
  name: string;

  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @Length(8, 20, { message: 'Le téléphone doit contenir entre 8 et 20 caractères' })
  @Matches(/^[+]?[\d\s\-\(\)]+$/, { message: 'Format de téléphone invalide' })
  @IsNotScript({ message: 'Le téléphone ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'Le téléphone contient des caractères non autorisés' })
  @Sanitize()
  telephone?: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @Length(5, 200, { message: 'L\'adresse doit contenir entre 5 et 200 caractères' })
  @IsNotScript({ message: 'L\'adresse ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'L\'adresse contient des caractères non autorisés' })
  @Sanitize()
  adresse?: string;

  @IsOptional()
  @IsString({ message: 'Le rôle doit être une chaîne de caractères' })
  @Length(3, 50, { message: 'Le rôle doit contenir entre 3 et 50 caractères' })
  @Matches(/^[a-zA-Z_]+$/, { message: 'Le rôle ne doit contenir que des lettres et underscores' })
  @IsNotScript({ message: 'Le rôle ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'Le rôle contient des caractères non autorisés' })
  role?: string;
}

// DTO sécurisé pour la création de produit
export class SecureCreateProductDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @Length(2, 100, { message: 'Le nom doit contenir entre 2 et 100 caractères' })
  @IsNotScript({ message: 'Le nom ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'Le nom contient des caractères non autorisés' })
  @Sanitize()
  name: string;

  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La description est requise' })
  @Length(10, 1000, { message: 'La description doit contenir entre 10 et 1000 caractères' })
  @IsNotScript({ message: 'La description ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'La description contient des caractères non autorisés' })
  @Sanitize()
  description: string;

  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @IsPositive({ message: 'Le prix doit être positif' })
  @Min(0.01, { message: 'Le prix minimum est 0.01' })
  @Max(999999.99, { message: 'Le prix maximum est 999999.99' })
  price: number;

  @IsInt({ message: 'Le stock doit être un nombre entier' })
  @Min(0, { message: 'Le stock ne peut pas être négatif' })
  @Max(999999, { message: 'Le stock maximum est 999999' })
  stock: number;

  @IsInt({ message: 'L\'ID de catégorie doit être un nombre entier' })
  @IsPositive({ message: 'L\'ID de catégorie doit être positif' })
  categoryId: number;

  @IsOptional()
  @IsString({ message: 'L\'URL de l\'image doit être une chaîne de caractères' })
  @Length(0, 500, { message: 'L\'URL de l\'image ne doit pas dépasser 500 caractères' })
  @IsNotScript({ message: 'L\'URL de l\'image ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'L\'URL de l\'image contient des caractères non autorisés' })
  imageUrl?: string;
}

// DTO sécurisé pour la création de client
export class SecureCreateClientDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @Length(2, 100, { message: 'Le nom doit contenir entre 2 et 100 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: 'Le nom ne doit contenir que des lettres, espaces, apostrophes et tirets' })
  @IsNotScript({ message: 'Le nom ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'Le nom contient des caractères non autorisés' })
  @Sanitize()
  name: string;

  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'L\'adresse est requise' })
  @Length(5, 200, { message: 'L\'adresse doit contenir entre 5 et 200 caractères' })
  @IsNotScript({ message: 'L\'adresse ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'L\'adresse contient des caractères non autorisés' })
  @Sanitize()
  address: string;

  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le téléphone est requis' })
  @Length(8, 20, { message: 'Le téléphone doit contenir entre 8 et 20 caractères' })
  @Matches(/^[+]?[\d\s\-\(\)]+$/, { message: 'Format de téléphone invalide' })
  @IsNotScript({ message: 'Le téléphone ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'Le téléphone contient des caractères non autorisés' })
  @Sanitize()
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @Length(5, 254, { message: 'L\'email doit contenir entre 5 et 254 caractères' })
  @IsNotScript({ message: 'L\'email ne doit pas contenir de scripts' })
  @IsNotSqlInjection({ message: 'L\'email contient des caractères non autorisés' })
  @Sanitize()
  email?: string;
}
