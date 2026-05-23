 import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "../components/Dashboard";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Alumni Dashboard · College ERP" },
      {
        name: "description",
        content:
          "Manage and track your college alumni network — add alumni, view companies, and grow placement opportunities.",
      },
    ],
  }),
});