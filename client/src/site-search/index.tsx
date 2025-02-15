import React from "react";
import { useSearchParams } from "react-router-dom";
import { useIsServer } from "../hooks";
import { Loading } from "../ui/atoms/loading";
import { MainContentContainer } from "../ui/atoms/page-content";
import { useGleanClick } from "../telemetry/glean-context";
import "./index.scss";
import { SidePlacement } from "../ui/organisms/placement";
import { CLIENT_SIDE_NAVIGATION } from "../telemetry/constants";

const SiteSearchForm = React.lazy(() => import("./form"));
const SearchResults = React.lazy(() => import("./search-results"));

export function SiteSearch() {
  const isServer = useIsServer();
  const gleanClick = useGleanClick();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q");
  const page = searchParams.get("page");
  React.useEffect(() => {
    if (query) {
      let title = `Search: "${query}"`;
      if (page && page !== "1") {
        title += ` (page ${page})`;
      }
      document.title = title;
    } else {
      document.title = "No query, no results.";
    }
  }, [query, page]);

  const mountCounter = React.useRef(0);
  React.useEffect(() => {
    if (mountCounter.current > 0) {
      const location = window.location.toString();
      gleanClick(`${CLIENT_SIDE_NAVIGATION}: ${location}`);
    }
    // By counting every time a document is mounted, we can use this to know if
    // a client-side navigation happened.
    mountCounter.current++;
  }, [query, page, gleanClick]);

  return (
    <div className="main-wrapper site-search">
      <MainContentContainer>
        <SidePlacement />
        <article className="main-page-content">
          {query ? (
            <h1>
              Search results for: <span className="query-string">{query}</span>{" "}
              {page && page !== "1" && `(page ${page})`}
            </h1>
          ) : (
            !isServer && <h1>No query, no results.</h1>
          )}

          {!isServer && (
            <React.Suspense fallback={<Loading />}>
              <SiteSearchForm />
            </React.Suspense>
          )}

          {!isServer && query && (
            <React.Suspense fallback={<Loading />}>
              <SearchResults />
            </React.Suspense>
          )}
        </article>
      </MainContentContainer>
    </div>
  );
}
