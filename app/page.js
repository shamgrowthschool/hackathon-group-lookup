"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    setResult(null);
    setMessage("");

    if (!trimmedEmail) {
      setMessage("Enter the email you used for hackathon registration.");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (!data.found) {
        setMessage("We could not find this email in the hackathon group list.");
        return;
      }

      setResult(data.learner);
    } catch (error) {
      setMessage("Could not check the sheet right now. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main className="page">
      <div className="ambientGrid" aria-hidden="true" />
      <section className="lookup">
        <div className="masthead">
          <div>
            <p className="eyebrow">AI Engineering Accelerator Hackathon</p>
            <h1>Find your build squad</h1>
          </div>
          <div className="livePill">
            <span />
            Live sheet
          </div>
        </div>
        <p className="subcopy">Enter your registered email to unlock your group number and WhatsApp invite link.</p>

        <div className="modeSwitch" aria-label="Lookup type">
          <button className="active" type="button">
            Group Lookup
          </button>
          <button className="locked" type="button" disabled aria-disabled="true" title="Hackathon Certificates is locked for now">
            Hackathon Certificates
            <span>Locked</span>
          </button>
        </div>

        <div className="signalBar" aria-label="Hackathon stages">
          {["Register", "Match", "Build", "Ship"].map(stage => (
            <span key={stage}>{stage}</span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="email">Registered email</label>
          <div className="inputRow">
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Checking..." : "Find My Group"}
            </button>
          </div>
        </form>

        {message && <div className="message">{message}</div>}

        {result && (
          <article className="result">
            <div className="resultTop">
              <span className="badge">{result.groupNo}</span>
              <span className="matched">Match found</span>
            </div>
            <h2>{result.name}</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{result.email}</dd>
              </div>
              <div>
                <dt>Group Number</dt>
                <dd>{result.groupNo}</dd>
              </div>
            </dl>
            {result.whatsappLink ? (
              <a className="joinButton" href={result.whatsappLink} target="_blank" rel="noreferrer">
                Join WhatsApp Group
              </a>
            ) : (
              <p className="message">Your group is assigned, but the WhatsApp link is not available yet.</p>
            )}
          </article>
        )}

        <footer className="footnote">The list refreshes from the sheet on every lookup. Certificates are locked for now.</footer>
      </section>
    </main>
  );
}
