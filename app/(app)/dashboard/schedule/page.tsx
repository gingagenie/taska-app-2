'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { EventDropArg } from '@fullcalendar/interaction';


type Job = {
  id: string;
  org_id: string;
  title: string;
  scheduled_for: string | null;
  duration_mins?: number | null;
  assigned_to?: string | null;
  status?: string | null;
};

type Member = { user_id: string; full_name: string | null; email: string | null };

export default function SchedulePage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [orgId, setOrgId] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Simple: get active org from profiles
  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
      if (prof?.active_org_id) setOrgId(prof.active_org_id);
    })();
  }, [supabase]);

  // Load members (for reassignment)
  useEffect(() => {
    if (!orgId) return;
    (async () => {
      // members via org_members ↔ profiles
      const { data, error } = await supabase
        .from('org_members')
        .select('user_id, profiles(full_name, email)')
        .eq('org_id', orgId);

      if (!error && data) {
        setMembers(
          data.map((r: any) => ({
            user_id: r.user_id,
            full_name: r.profiles?.full_name ?? null,
            email: r.profiles?.email ?? null,
          }))
        );
      }
    })();
  }, [orgId, supabase]);

  // Load jobs for the visible month (we’ll refresh on calendar range change too)
  const loadJobsForRange = async (startISO?: string, endISO?: string) => {
    if (!orgId) return;

    let q = supabase
      .from('jobs')
      .select('id, org_id, title, scheduled_for, duration_mins, assigned_to, status')
      .eq('org_id', orgId)
      .order('scheduled_for', { ascending: true });

    if (startISO && endISO) {
      q = q.gte('scheduled_for', startISO).lt('scheduled_for', endISO);
    }

    const { data, error } = await q;
    if (!error && data) setJobs(data as any);
  };

  // Initial load (no range = everything; we’ll tighten on view change)
  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    loadJobsForRange().finally(() => setLoading(false));
  }, [orgId]); // eslint-disable-line

  // Transform jobs -> calendar events
  const events = useMemo(() => {
    return jobs
      .filter((j) => j.scheduled_for)
      .map((j) => {
        const start = new Date(j.scheduled_for as string);
        const dur = (j.duration_mins ?? 60) * 60 * 1000;
        const end = new Date(start.getTime() + dur);

        const tech =
          members.find((m) => m.user_id === j.assigned_to)?.full_name ||
          members.find((m) => m.user_id === j.assigned_to)?.email ||
          '';

        return {
          id: j.id,
          title: [j.title, tech ? `• ${tech}` : ''].filter(Boolean).join(' '),
          start,
          end,
          allDay: false,
        };
      });
  }, [jobs, members]);

  // Drag to a new date -> update scheduled_for
  const onEventDrop = async (info: EventDropArg) => {
    const id = info.event.id;
    const newStart = info.event.start; // Date
    if (!newStart) return;

    const { error } = await supabase
      .from('jobs')
      .update({ scheduled_for: newStart.toISOString() })
      .eq('id', id);

    if (error) {
      console.error(error);
      info.revert();
    } else {
      // keep local state in sync
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, scheduled_for: newStart.toISOString() } : j))
      );
    }
  };

  // Reassign technician on event click (simple prompt)
  const onEventClick = async (arg: any) => {
    if (!members.length) return;

    const labels = members.map(
      (m) => `${m.full_name ?? m.email ?? m.user_id} (${m.user_id.slice(0, 6)})`
    );
    const which = prompt(
      `Reassign job to which tech?\n\n${labels.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n` +
        `Enter number (1-${members.length}), or leave blank to cancel:`
    );
    const idx = which ? parseInt(which, 10) - 1 : -1;
    if (idx < 0 || idx >= members.length) return;

    const jobId = arg.event.id;
    const techId = members[idx].user_id;

    const { error } = await supabase.from('jobs').update({ assigned_to: techId }).eq('id', jobId);
    if (error) {
      alert(error.message);
      return;
    }
    // Local title refresh
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, assigned_to: techId } : j))
    );
  };

  // When the calendar navigates/month changes, load that range only
  const onDatesSet = (info: { start: Date; end: Date }) => {
    const startISO = info.start.toISOString();
    const endISO = info.end.toISOString();
    loadJobsForRange(startISO, endISO);
  };

  return (
    <div className="space-y-6">
      <header className="t-header">
        <h1 className="t-h1">Schedule</h1>
        {/* room for filters later */}
      </header>

      <div className="card p-4">
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          editable
          droppable={false}
          events={events}
          eventDrop={onEventDrop}
          eventClick={onEventClick}
          datesSet={onDatesSet}
          firstDay={1} // Monday
        />
      </div>
    </div>
  );
}
