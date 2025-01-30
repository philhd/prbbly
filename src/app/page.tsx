"use client";

import React, { useState } from "react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<
    { token: string; topLogProbs: any }[]
  >([]);

  const handlePlay = async () => {
    setLoading(true);
    setTokens([]);
    try {
      const res = await fetch("/api/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, temperature, top_p: topP }),
      });

      const data = await res.json();
      if (!data.success) {
        console.error("Error from API:", data.error);
        setLoading(false);
        return;
      }

      // The hypothetical data shape from Chat Completions with logprobs
      //
      // For the older Completions endpoint, you'd see something like:
      // data.result.choices[0].logprobs.tokens
      // data.result.choices[0].logprobs.top_logprobs
      //
      // We'll assume the shape is:
      // data.result.choices[0].logprobs.tokens => [ "Hello", " world", ... ]
      // data.result.choices[0].logprobs.top_logprobs => [
      //   { "Hello": -0.1, "Goodbye": -1.2, ... }, { " world": -0.05, ...}, ...
      // ]
      //
      // This is hypothetical structure if Chat Completions returned logprobs.

      const choice = data.result?.choices?.[0];
      if (choice?.logprobs && choice.logprobs.content) {
        const tokenList = choice.logprobs.content;

        // Construct array of token + top_logprobs
        const tokenData = tokenList.map(
          (item: any) => ({
            token: item.token,
            topLogProbs: item.top_logprobs,
          })
        );

        setTokens(tokenData);
      } else {
        console.log("No logprobs found in response.");
      }
    } catch (err) {
      console.error("Request failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Utility to convert log probability to percentage
  const logProbToPercent = (logProb: number) => {
    // e^logProb = probability
    return Math.exp(logProb) * 100; // scale to 0-100%
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">OpenAI LogProbs Demo</h1>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label htmlFor="prompt" className="block font-medium">
          Prompt
        </label>
        <textarea
          id="prompt"
          className="w-full p-2 text-black border border-gray-300 rounded"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Temperature Slider */}
      <div>
        <label htmlFor="temperature" className="block font-medium">
          Temperature: {temperature.toFixed(2)}
        </label>
        <input
          id="temperature"
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Top_p Slider */}
      <div>
        <label htmlFor="topP" className="block font-medium">
          Top_p: {topP.toFixed(2)}
        </label>
        <input
          id="topP"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={topP}
          onChange={(e) => setTopP(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Play Button */}
      <div>
        <button
          onClick={handlePlay}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Loading..." : "Play"}
        </button>
      </div>

      {/* Tokens + Probabilities Visualization */}
      <div className="space-y-4">
        {tokens.map(({ token, topLogProbs }, idx) => {
          // Sort topLogProbs by descending probability
          const sorted = Object.entries(topLogProbs).sort((a, b) => {
            const probA = Math.exp(a[1]);
            const probB = Math.exp(b[1]);
            return probB - probA; // descending
          });

          return (
            <div key={idx} className="p-3 bg-white rounded shadow">
              <div className="font-bold text-black mb-2">Token: <span className="text-blue-600">{token}</span></div>
              {sorted.slice(0, 10).map(([index, logP], i) => {
                const percentage = logProbToPercent(logP.logprob);
                return (
                  <div key={i} className="flex items-center mb-1">
                    <div className="w-1/5 text-sm text-black whitespace-nowrap overflow-hidden overflow-ellipsis pr-2">
                      {logP.token.replace(/\n/g, "\\n")}
                    </div>
                    <div className="flex-1 bg-gray-200 h-4 rounded">
                      <div
                        className="bg-green-500 h-4 rounded"
                        style={{ width: `${percentage.toFixed(2)}%` }}
                      />
                    </div>
                    <div className="w-16 text-black  text-right text-sm pl-2">
                      {percentage.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
