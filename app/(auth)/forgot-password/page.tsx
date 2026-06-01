"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  MailIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestCode() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível solicitar o código.");
      }

      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        throw new Error("Código inválido ou expirado.");
      }

      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function resetPassword() {
    setIsLoading(true);
    setError("");

    if (password !== passwordConfirm) {
      setError("As senhas não conferem.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível redefinir a senha.");
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-start">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeftIcon className="size-4" />
            Voltar para login
          </Link>
        </div>

        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
          {step === "success" ? (
            <CheckCircle2Icon className="size-6 text-primary" />
          ) : step === "email" ? (
            <MailIcon className="size-6 text-primary" />
          ) : (
            <KeyRoundIcon className="size-6 text-primary" />
          )}
        </div>

        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          {step === "email" && "Informe o email cadastrado."}
          {step === "code" && "Digite o código temporário recebido por email."}
          {step === "password" && "Defina uma nova senha para sua conta."}
          {step === "success" && "Sua senha foi redefinida com sucesso."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "email" && (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Button
              type="button"
              className="mt-2 w-full"
              disabled={isLoading || !email.trim()}
              onClick={requestCode}
            >
              {isLoading ? <Spinner /> : "Enviar código"}
            </Button>
          </FieldGroup>
        )}

        {step === "code" && (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="code">Código temporário</FieldLabel>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="text-center text-xl font-bold tracking-[0.5em]"
              />
            </Field>

            <Button
              type="button"
              className="mt-2 w-full"
              disabled={isLoading || code.length !== 6}
              onClick={verifyCode}
            >
              {isLoading ? <Spinner /> : "Validar código"}
            </Button>
          </FieldGroup>
        )}

        {step === "password" && (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Nova senha</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password-confirm">Confirmar nova senha</FieldLabel>
              <Input
                id="password-confirm"
                type="password"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
              />
            </Field>

            <Button
              type="button"
              className="mt-2 w-full"
              disabled={isLoading || password.length < 8 || passwordConfirm.length < 8}
              onClick={resetPassword}
            >
              {isLoading ? <Spinner /> : "Redefinir senha"}
            </Button>
          </FieldGroup>
        )}

        {step === "success" && (
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm text-muted-foreground">
              Volte para a tela de login e acesse sua conta com a nova senha.
            </p>

            <Button asChild className="w-full">
              <Link href="/login">Ir para login</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}