import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders topbar brand", () => {
  render(<App />);
  // Verify brand text exists
  const brand = screen.getByText(/Personal Notes/i);
  expect(brand).toBeInTheDocument();
});
