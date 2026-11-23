import React from "react";
import { ResumeProvider } from "@/context/ResumeContext";
import ResumeApp from "@/components/ResumeApp";

export default function App() {
  return (
    <ResumeProvider>
      <ResumeApp />
    </ResumeProvider>
  );
}
