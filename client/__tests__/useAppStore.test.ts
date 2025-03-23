import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "@/lib/store";
import type { Assignment } from "@/lib/types";

describe("useAppStore - Assignments", () => {
  it("should add a new assignment", () => {
    const { result } = renderHook(() => useAppStore());

    const initialAssignmentsLength = result.current.assignments.length;

    const newAssignment: Omit<Assignment, "id" | "createdAt" | "updatedAt"> = {
      title: "Graph Algorithm Problem",
      description: "Solve a shortest path problem using Dijkstra's Algorithm.",
      dueDate: "Apr 10, 2024",
      status: "not-started",
      progress: 0,
      mentorId: "1",
      menteeId: "3",
    };

    act(() => {
      result.current.addAssignment(newAssignment);
    });

    expect(result.current.assignments.length).toBe(initialAssignmentsLength + 1);

    const addedAssignment = result.current.assignments.find(
      (a) => a.title === "Graph Algorithm Problem"
    );

    expect(addedAssignment).toBeDefined();
    expect(addedAssignment?.status).toBe("not-started");
    expect(addedAssignment?.progress).toBe(0);
    expect(addedAssignment?.mentorId).toBe("1");
    expect(addedAssignment?.menteeId).toBe("3");
    expect(addedAssignment?.createdAt).toBeDefined();
    expect(addedAssignment?.updatedAt).toBeDefined();
  });

  it("should update an assignment status and progress", () => {
    const { result } = renderHook(() => useAppStore());

    const assignmentId = result.current.assignments[0].id; // Pick first assignment

    act(() => {
      result.current.updateAssignmentStatus(assignmentId, "completed", 100);
    });

    const updatedAssignment = result.current.assignments.find((a) => a.id === assignmentId);

    expect(updatedAssignment).toBeDefined();
    expect(updatedAssignment?.status).toBe("completed");
    expect(updatedAssignment?.progress).toBe(100);
  });

  it("should not update a non-existent assignment", () => {
    const { result } = renderHook(() => useAppStore());

    const fakeId = "non-existent-id";

    act(() => {
      result.current.updateAssignmentStatus(fakeId, "completed", 100);
    });

    const updatedAssignment = result.current.assignments.find((a) => a.id === fakeId);

    expect(updatedAssignment).toBeUndefined();
  });

  it("should retrieve assignments for a specific mentee", () => {
    const { result } = renderHook(() => useAppStore());

    const menteeId = "1";
    const menteeAssignments = result.current.assignments.filter((a) => a.menteeId === menteeId);

    expect(menteeAssignments.length).toBeGreaterThan(0);
    expect(menteeAssignments.every((a) => a.menteeId === menteeId)).toBe(true);
  });

  it("should retrieve assignments for a specific mentor", () => {
    const { result } = renderHook(() => useAppStore());

    const mentorId = "1";
    const mentorAssignments = result.current.assignments.filter((a) => a.mentorId === mentorId);

    expect(mentorAssignments.length).toBeGreaterThan(0);
    expect(mentorAssignments.every((a) => a.mentorId === mentorId)).toBe(true);
  });

});
