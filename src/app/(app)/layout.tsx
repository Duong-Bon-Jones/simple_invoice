export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: authed nav shell
  return <div>{children}</div>;
}
