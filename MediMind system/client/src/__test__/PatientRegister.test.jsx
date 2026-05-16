import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import PatientRegister from "../components/PatientRegister";

vi.mock("../assets/medimindlogo.jpg", () => ({
  default: "medimindlogo.jpg",
}));

vi.mock("../components/footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../features/UserSlice", () => ({
  addUser: vi.fn((data) => ({
    type: "user/addUser",
    payload: data,
  })),
}));

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      user: {
        message: "",
      },
    }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PatientRegister Component", () => {
  it("renders patient registration page", () => {
    render(
      <MemoryRouter>
        <PatientRegister />
      </MemoryRouter>
    );

    expect(screen.getByText("Patient Registration")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Phone Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("adds selected medical condition", () => {
    render(
      <MemoryRouter>
        <PatientRegister />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByDisplayValue("Select Condition"), {
      target: { value: "Diabetes" },
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ add condition/i }));

    expect(screen.getByText("Condition added")).toBeInTheDocument();
  });

  it("go back button navigates to splash screen", () => {
    render(
      <MemoryRouter>
        <PatientRegister />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/Splashscreen");
  });
});