/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: import('./lib/auth').SessionUser | null;
  }
}
