// page.js
import { Suspense } from "react";
import IncomePage from "./IncomePageInner";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IncomePage />
    </Suspense>
  );
}
