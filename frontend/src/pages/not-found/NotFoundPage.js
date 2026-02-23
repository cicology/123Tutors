import React from "react";
import Seo from "../../components/seo/Seo";
import PageHeader from "../../components/ui/PageHeader";

export default function NotFoundPage() {
  return (
    <section className="page-wrap">
      <Seo title="Page Not Found" noIndex />
      <PageHeader
        title="Page not found"
        description="The route you requested does not exist."
      />
    </section>
  );
}
