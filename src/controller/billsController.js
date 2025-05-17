import Bills from "../models/billsModel.js"

// Controller to add a new bill
export const addBillsController = async (req, res) => {
  try {
    const newBill = new Bills(req.body)
    await newBill.save()
    res.status(201).send("Bill created successfully")
  } catch (error) {
    res.status(400).send(error)
  }
}

// Controller to get all bills
export const getBillsController = async (req, res) => {
  try {
    const bills = await Bills.find().sort({ createdAt: -1 })
    res.status(200).send(bills)
  } catch (error) {
    res.status(400).send(error)
  }
}

// Controller to get bills by user (name or phone number)
export const getUserBillsController = async (req, res) => {
  try {
    const { userId } = req.params

    // Find bills by customer name or phone number
    const bills = await Bills.find({
      $or: [{ customerName: userId }, { customerNumber: userId }],
    }).sort({ createdAt: -1 })

    res.status(200).send(bills)
  } catch (error) {
    res.status(400).send(error)
  }
}

// Controller to delete a bill
export const deleteBillController = async (req, res) => {
  try {
    await Bills.findByIdAndDelete(req.params.id)
    res.status(200).send("Bill deleted successfully")
  } catch (error) {
    res.status(400).send(error)
  }
}
