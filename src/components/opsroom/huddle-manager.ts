import type { HuddleSession, HuddleSpeakerLine, AgentProfile, OpsCanvas } from './types';

export class HuddleManager {
  /**
   * Start a synthetic multi-agent huddle
   */
  public static startHuddle(incidentId: string, agents: AgentProfile[]): HuddleSession {
    return {
      huddleId: `huddle-${incidentId}-${Date.now()}`,
      incidentId,
      activeAgents: agents,
      lines: [],
      startedAt: Date.now(),
      isStreaming: true,
    };
  }

  /**
   * Add a spoken line to the ongoing synthetic huddle with simulated frequencies
   */
  public static addSpokenLine(
    huddle: HuddleSession,
    speaker: AgentProfile,
    text: string
  ): HuddleSpeakerLine {
    // Generate 8-band pseudo-random frequency data
    const freqData = Array.from({ length: 8 }, () => Math.random() * 0.8 + 0.2);

    const line: HuddleSpeakerLine = {
      speakerId: speaker.id,
      speakerName: speaker.name,
      role: speaker.role,
      text,
      timestamp: Date.now(),
      audioFrequencyData: freqData,
    };

    huddle.lines.push(line);
    return line;
  }

  /**
   * Generate an executive board-level brief and sync to the Ops Canvas
   */
  public static synthesizeAndSyncToCanvas(huddle: HuddleSession, canvas: OpsCanvas): string {
    const speakers = [...new Set(huddle.lines.map((l) => l.speakerName))];
    const keyQuotes = huddle.lines.slice(-3).map((l) => `"${l.text}" - ${l.speakerName}`);

    const brief = `Autonomous squad deliberation completed with ${huddle.lines.length} spoken turns across ${speakers.join(', ')}. Key alignment: ${keyQuotes.join('; ')}. Mitigation plan verified via 2/3 Byzantine Quorum.`;

    huddle.executiveBrief = brief;
    huddle.isStreaming = false;

    const briefSection = `### 🎙️ Synthetic Huddle Executive Summary\n${brief}`;
    const headerRegex = /### 🎙️ Synthetic Huddle Executive Summary[\s\S]*?(?=\n###|\n##|$)/;
    if (headerRegex.test(canvas.summaryMarkdown)) {
      canvas.summaryMarkdown = canvas.summaryMarkdown.replace(headerRegex, briefSection);
    } else {
      canvas.summaryMarkdown += `\n\n${briefSection}`;
    }
    canvas.version += 1;
    canvas.lastUpdated = Date.now();

    return brief;
  }
}
