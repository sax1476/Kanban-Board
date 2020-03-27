# Kanban-Board
A vanilla javascript Kanban Board to learn about drag &amp; drop

Feature: 
- Save to local storage
- Add card
- Customize maximum number of cards
- Move, change, delete card via drag &amp; drop

Structure:
// Handle local storage data
data = {
  getData(): get data from local storage,
  setData(): save data to local storage,
  add(): add new card,
  delete(): delete card,
  change(): change card,
  move(): move card,
}
// Handle drag &amp; drop events
drag = {
  start(): card's dragstart event,
  end(): card's dragend event,
  nearest(): find nearest item in card moving event,
  delete(): card's delete event,
  changeCancel(): cancel change event's pop-up,
  changeSubmit(): change event's submit
 }
 // Handle view
 view = {
  cards(): display cards, button from data,
  showChangePopup(): show change pop-up,
  showMaxPopup(): show max change pop-up
 }
 // Handle max button
 max = {
  maxCancel(): max pop-up cancel,
  maxSubmit(): max pop-up submit
 }
