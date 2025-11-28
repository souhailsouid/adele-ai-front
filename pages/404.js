
import { useEffect } from "react";
import Router from "next/router";

export default function Custom404() {
  useEffect(() => {
    Router.push("/");
  });

  return <div />;
}
