import { activityLogRows, leadActivityToCsv } from "@/lib/leads/csv";

describe("lead activity export", () => {
  const activity = [
    {
      action: "Status changed to contacted",
      user: { name: "Ayesha" },
      timestamp: "2026-11-01T10:00:00.000Z",
    },
    {
      action: "Note added",
      note: 'Called, said "call back"',
      user: { name: "Hamza" },
      timestamp: "2026-11-02T12:30:00.000Z",
    },
  ];

  it("lists the newest log first and keeps an earlier note at the end", () => {
    expect(activityLogRows(activity, "  Old intake note  ")).toEqual([
      {
        when: "2026-11-02T12:30:00.000Z",
        action: "Note added",
        note: 'Called, said "call back"',
        user: "Hamza",
      },
      {
        when: "2026-11-01T10:00:00.000Z",
        action: "Status changed to contacted",
        note: "",
        user: "Ayesha",
      },
      {
        when: "",
        action: "Earlier note",
        note: "Old intake note",
        user: "",
      },
    ]);
  });

  it("quotes notes so commas and quotes survive in the csv", () => {
    const csv = leadActivityToCsv(activity, "");
    expect(csv.split("\n")[0]).toBe("When,Action,Note,By");
    expect(csv).toContain('"Called, said ""call back"""');
    expect(csv.indexOf("Note added")).toBeLessThan(csv.indexOf("Status changed to contacted"));
  });
});
