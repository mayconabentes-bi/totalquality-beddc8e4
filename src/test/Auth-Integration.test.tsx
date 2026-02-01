import { describe, it, expect } from "vitest";
import { signupSchema } from "@/pages/Auth";

/**
 * Integration tests for Auth.tsx finalization requirements
 * 
 * These tests verify:
 * 1. Registration form captures exactly 6 fields
 * 2. CNPJ is cleaned (numbers only) for database insertion
 * 3. Phone field is optional
 */
describe("Auth.tsx - Final Configuration", () => {
  describe("Signup Schema Validation", () => {
    it("should validate all 6 required signup fields", () => {
      const validData = {
        fullName: "João Silva",
        companyName: "Empresa Teste Ltda",
        cnpj: "12.345.678/0001-90", // Formatted CNPJ
        phone: "(11) 98765-4321",
        email: "joao@empresa.com",
        password: "senha123"
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should clean CNPJ removing all formatting characters", () => {
      const formattedCnpj = "12.345.678/0001-90";
      const expectedCleanCnpj = "12345678000190";
      
      const data = {
        fullName: "João Silva",
        companyName: "Empresa Teste Ltda",
        cnpj: formattedCnpj,
        phone: "(11) 98765-4321",
        email: "joao@empresa.com",
        password: "senha123"
      };

      const result = signupSchema.safeParse(data);
      
      if (result.success) {
        expect(result.data.cnpj).toBe(expectedCleanCnpj);
        expect(result.data.cnpj).toMatch(/^\d{14}$/); // Only digits, exactly 14
      } else {
        throw new Error("Schema validation failed");
      }
    });

    it("should reject CNPJ with incorrect number of digits", () => {
      const invalidCnpj = "12.345.678/0001-9"; // Only 13 digits
      
      const data = {
        fullName: "João Silva",
        companyName: "Empresa Teste Ltda",
        cnpj: invalidCnpj,
        phone: "(11) 98765-4321",
        email: "joao@empresa.com",
        password: "senha123"
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("14 dígitos");
      }
    });

    it("should accept phone as optional field", () => {
      const dataWithoutPhone = {
        fullName: "João Silva",
        companyName: "Empresa Teste Ltda",
        cnpj: "12.345.678/0001-90",
        // phone field omitted
        email: "joao@empresa.com",
        password: "senha123"
      };

      const result = signupSchema.safeParse(dataWithoutPhone);
      expect(result.success).toBe(true);
    });

    it("should accept empty phone field", () => {
      const dataWithEmptyPhone = {
        fullName: "João Silva",
        companyName: "Empresa Teste Ltda",
        cnpj: "12.345.678/0001-90",
        phone: "",
        email: "joao@empresa.com",
        password: "senha123"
      };

      const result = signupSchema.safeParse(dataWithEmptyPhone);
      expect(result.success).toBe(true);
    });

    it("should require full name with at least 2 characters", () => {
      const data = {
        fullName: "J", // Too short
        companyName: "Empresa Teste Ltda",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 98765-4321",
        email: "joao@empresa.com",
        password: "senha123"
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should require company name with at least 2 characters", () => {
      const data = {
        fullName: "João Silva",
        companyName: "E", // Too short
        cnpj: "12.345.678/0001-90",
        phone: "(11) 98765-4321",
        email: "joao@empresa.com",
        password: "senha123"
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should require valid email format", () => {
      const data = {
        fullName: "João Silva",
        companyName: "Empresa Teste Ltda",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 98765-4321",
        email: "invalid-email", // Invalid format
        password: "senha123"
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should require password with at least 6 characters", () => {
      const data = {
        fullName: "João Silva",
        companyName: "Empresa Teste Ltda",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 98765-4321",
        email: "joao@empresa.com",
        password: "12345" // Too short
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
