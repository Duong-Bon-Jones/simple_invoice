import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserBadge } from "./user-badge";
import { useSession } from "@/components/session-context";

vi.mock("@/components/session-context", () => ({
  useSession: vi.fn(),
}));

const mockUseSession = vi.mocked(useSession);

describe("UserBadge", () => {
  it("shows initials from a first and last name", () => {
    mockUseSession.mockReturnValue("Jane Doe");
    render(<UserBadge />);
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("shows a single initial for a one-word name", () => {
    mockUseSession.mockReturnValue("Jane");
    render(<UserBadge />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("uses first and last initials for names with more than two parts", () => {
    mockUseSession.mockReturnValue("Jane Middle Doe");
    render(<UserBadge />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("falls back to a dash and 'Unknown user' when there is no name", () => {
    mockUseSession.mockReturnValue(null);
    render(<UserBadge />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Unknown user")).toBeInTheDocument();
  });
});
