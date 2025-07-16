import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";
import user from "../models/user.js";

export const createTicket = async (res, req) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(404)
        .json({ message: "Title and status are required " });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket.created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    return res
      .status(201)
      .json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res
      .status(500)
      .json({ message: "Error creating ticket", error: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let tickets = [];
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    return res
      .status(200)
      .json({ message: "Tickets fetched successfully", tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res
      .status(500)
      .json({ message: "Error fetching tickets", error: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const user = req.user;
    let ticket;
    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id)
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      ticket = await Ticket.findOne({ createdBy: user._id, _id: req.params.id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res
      .status(200)
      .json({ message: "Ticket fetched successfully", ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res
      .status(500)
      .json({ message: "Error fetching ticket", error: error.message });
  }
};
