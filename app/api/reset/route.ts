import { resetAllTasksAndSubtasks } from "@/lib/database"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const result = await resetAllTasksAndSubtasks()

    if (result.success) {
      return NextResponse.json({ success: true, message: "All tasks and subtasks have been reset" })
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to reset tasks and subtasks", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "An error occurred", error: String(error) }, { status: 500 })
  }
}
