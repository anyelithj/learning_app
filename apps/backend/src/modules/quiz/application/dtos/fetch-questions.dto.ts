import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Category } from '../../domain/value-objects/category.vo';
import { Difficulty } from '../../domain/value-objects/difficulty.vo';
import { DEFAULT_LANGUAGE, Language } from '../../domain/value-objects/language.vo';
import { QuestionType } from '../../domain/entities/question.entity';
// [DTO Fetch Trivia]: input para traer preguntas desde OpenTrivia | [Patrón]: DTO | [Principio]: SRP

export class FetchQuestionsDto {
  @ApiProperty({ default: 10, minimum: 1, maximum: 50 })
  @IsInt()
  @Min(1)
  @Max(50)
  amount!: number;

  @ApiProperty({ enum: Category, required: false })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiProperty({ enum: Difficulty, required: false })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ enum: QuestionType, required: false })
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  // [Idioma destino]: si != EN se traduce post-fetch via ITranslator | [Patrón]: Strategy hint | [Principio]: OCP
  @ApiProperty({ enum: Language, required: false, default: DEFAULT_LANGUAGE })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}
