/**
 * SAYU Type System Central Definitions (TypeScript)
 * This is the SINGLE SOURCE OF TRUTH for all SAYU personality types
 *
 * DO NOT CREATE NEW TYPE DEFINITIONS ELSEWHERE!
 * Always import and use these definitions.
 */
export interface SAYUType {
    code: string;
    name: string;
    nameEn: string;
    animal: string;
    animalEn: string;
    emoji: string;
    description: string;
    detailedDescription: string;
    artPreferences: {
        preferredStyles: string[];
        preferredSubjects: string[];
        preferredColors: string[];
        viewingStyle: string;
        motivations: string[];
    };
    characteristics: string[];
    strengths: string[];
    challenges: string[];
    perfectDay: string;
    famousExample?: string;
    dominantFunction: string;
    inferiorFunction: string;
    consciousFunctions: string[];
    unconsciousFunctions: string[];
}
export interface SAYUFunction {
    code: string;
    name: string;
    axis: 'L/S' | 'A/R' | 'E/M' | 'F/C';
    description: string;
}
export declare const SAYU_TYPES: Readonly<Record<string, SAYUType>>;
export declare const SAYU_FUNCTIONS: Readonly<Record<string, SAYUFunction>>;
export declare const VALID_TYPE_CODES: readonly string[];
export type SAYUTypeCode = keyof typeof SAYU_TYPES;
export type SAYUFunctionCode = keyof typeof SAYU_FUNCTIONS;
export type PersonalityType = SAYUTypeCode;
export declare function isValidSAYUType(typeCode: string): typeCode is SAYUTypeCode;
export declare function validateSAYUType(typeCode: string): asserts typeCode is SAYUTypeCode;
export declare function getSAYUType(typeCode: string): SAYUType;
export declare function getSAYUFunction(functionCode: string): SAYUFunction;
export declare function getAllSAYUTypes(): SAYUType[];
export declare function getAllSAYUFunctions(): SAYUFunction[];
export interface ParsedSAYUType {
    social: 'L' | 'S';
    style: 'A' | 'R';
    response: 'E' | 'M';
    approach: 'F' | 'C';
    fullType: SAYUType;
}
export declare function parseSAYUTypeCode(typeCode: string): ParsedSAYUType;
//# sourceMappingURL=SAYUTypeDefinitions.d.ts.map