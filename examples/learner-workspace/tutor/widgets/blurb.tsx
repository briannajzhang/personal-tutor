import type { BlurbWidget } from "tutor-kit";

export const blurbWidget = {
  kind: "blurb",
  title: "Blurb",
  renderText(widget: BlurbWidget): string {
    return widget.props.body;
  }
};
