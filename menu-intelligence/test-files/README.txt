PIHOCO Menu Intelligence — test files (illustrative data, not client data)

Set 1  Café, India, INR, one month
  1_cafe_item_sales_oct2026.csv   POS item-sales export (has title rows and a Total row, like a real export)
  1_cafe_recipe_costs.xlsx        Recipe cost per portion

Set 2  Restaurant, US, USD
  2_restaurant_item_sales.csv     Item, Category, Items Sold, Gross Sales (no price column: the portal works it out)
  2_restaurant_food_costs.csv     Food cost per dish (some names in different case/spacing to test matching)

Set 3  Messy data (to see the data checks)
  3_messy_item_sales.csv          Has a duplicate row and a zero-sales item
  3_messy_recipe_costs.csv        Two dishes missing costs, one cost above price, one costed dish not on the sales report

Set 4  One combined file
  4_bar_combined_template.xlsx    Sales and food cost in one sheet (the PIHOCO template layout). Upload it alone.

Set 5  Café, Dubai, AED, 30 days, menu prices include 5% VAT
  5_dubai_cafe_sales_aed.csv        Product-mix export (title rows, category first)
  5_dubai_cafe_recipe_costs.xlsx    Plate costs; "Club, chicken" and "Acai bowl" test the name matching
  Tip: under "More options", tick "Prices include VAT" (5%) and try a delivery share.

Note: sets 1, 3 and 4 are in Indian rupees but the files carry no currency symbol.
Open "More options" and pick INR before analysing (the portal defaults to AED).
