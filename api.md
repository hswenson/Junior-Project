# Documentation
Version 1.0  
Authors: Nick Swenson, Royal Morris
&copy; 

## About Us 


## Table of Contents


# Public API

### Customer

*Customer* **create** ( *string* email, *string* password, *string* firstName, *string* lastName )
> Creates a new account in Magento. This api should be accessed through the Magento API. A new account should be returned. 	http://www.magentocommerce.com/api/soap/customer/customer.create.html

*Customer* **get** ( )
> Gets the currently authorized customer from the Magento database. 

*Customer* **update** ([ *string* firstName, *string* lastName, *string* password, *string* email, *string* phone, *string* shippingAddressLine1, *string* shippingCity, *string* shippingState, *string* shippingZipcode, *string* shippingCountry])
> Updates the account information for a customer. returns the Customer.

*Customer* **updateCreditCard** ([ *string* ccNumber, *string* ccName, *date* ccExpDate, *string* ccCode, *string* billingAddressLine1, *string* billingCity, *string* billingState, *string* billingCountry, *string* billingZipCode]);
> Updates the credit card info for a user.

### UserConfig

*UserConfig* **update** ([ *boolean* notificationNewProducts, *boolean* notificationSubscriptionStatus ])
> Updates the notification configs for a customer.

### Subscription

*Subscription* **create** ( *string* productSku, *string* subscriptionOptionId[, *date* nextShipmentDate ])
> Creates a subscription for a customer on a recurring basis. The details of the subscription are determined by the subscriptionOptionId. All the proper details must be saved for a customer otherwise the purchase will fail. If nextShipmentDate is not provided, the nextShipmentDate in SubscriptionOption is selected.

*Subscription* **get** ([ *string* subscriptionId, *string* ownedProductId ])
> Gets a subscription for a owned product. Must provide either a subscriptionId or a ownedProductId. Returns null if no subscription exists.

*Subscription* **update** ( *string* subscriptionId[, *string* subscriptionOptionId, *date* nextShipmentDate ])
> Updates the details of a subscription. Upon success the Subscription model is returned, upon failure, an error is returned.

*Subscription* **cancel** ( *string* subscriptionId)
> Cancels a subscription. The cancelled subscription returns to the client.

### SubscriptionOption

*array(SubscriptionOption)* **get** ( *string* productSku )
> Gets the SubscriptionOption model for the product sku

### Order
*Order* **create** ( *string* productSku, *string* shippingId [, *number* quantity=1 ] );
> Creates an order for a user. The user must have the appropriate information saved, such as credit card, billing info and shipping info saved to successfully create the order.

*Order* **get** ( *int* orderId );
> Gets an Order for the Customer. Returns null if no order found.

### Products
*array(Product)* **get** ([ *string|array(string)* productSku, *number* ProductType, *string* linerCode )
> Gets the product or products.
> If an array of skus or a single sku is provided, all other options are ignored. If no sku is provided, then the products are first filtered by ProductType, then by linerCode.
> Returns null if a single sku given and if none found, returns array;

*string* **register** ( *string* productSku, *string* firstName, *string* lastName, *string* email, *string* addressLine1, *string* city, *string* state, *string* zipCode, *string* phone, *string* retailer, *date* purchaseDate)
> Allows a customer to register their product and receive a product response in return. This call can be made directly to Magento or can be proxied through the swensonhe server.

### OwnedProduct
*OwnedProduct|array(OwnedProduct)* **get** ([ *string* ownedProductId ])
> Returns the products that are owned by the customer. If authed and no arguments, returns all. If not authed, returns [];

*OwnedProduct* **create** ( *string* productSku[, *string* name ]);
> Creates a product for the customer with a specific name. Any name can be stipulated.

*OwnedProduct* **update** ( *string* ownedProductId[, *string* nickname ])
> Updates an owned product for the customer. Can change basic default settings.

*OwnedProduct* **delete** ( *string* ownedProductId )
> Will delete a owned product from the customers portfolio. ALL ACTIVE SUBSCRIPTIONS WILL BE DEFEATED.

### AVS
*AVSModel* **runAvs** ( *string* addressLine1, *string* city, *string* state, *string* zipCode, *string* country )
> The AVS module will try to validate the address verification and return the appropriate error to the client. Please reference the documentation in the simplehuman projects folder under documentation for morre information.

### Notification
*array(Notification)* **get** ([ *string* lastNotificationId ])
> Returns the last 50 notifications if no argument is given. Else returns all notifications, not including one provided, since the last one given. 

# Data Models

These models are stored in the database. All attributes of the model are returned to the client unless otherwise specified. *Virtual* attributes are not stored in the database, rather appended at the top level API before sending to client. *Database storage only* are removed from model before sending to client

## Address
**addressLine1**
> *string*

**city**
> *string*

**state**
> *string*

**zipCode**
> *string*

**country**
> *string*

**passedAVS**
> *boolean*


## Avs
**addressLine1**
> *string*

**city**
> *string*

**state**
> *string*

**zipCode**
> *string*

**country**
> *string*

**passedAVS**
> *boolean*


## CouponCode
**created**
> *Date*

**lastUsed**
> *Date*

**couponCode**
> *string*

**couponId**
> *string*

**maxUses**
> *number*

**totalUses**
> *number*

**isValid**
> *boolean*

**amountDiscounted**
> *number*

**percentDiscounted**
> *number*


## CreditCard
**billingAddress**
> *Address*

**engine**
> *string*

**ccToken**
> *string*

**ccName**
> *string*

**created**
> *Date*


## Customer
**created**
> *date*

**firstName**
> *string*

**lastName**
> *string*

**email**
> *string*

**phone**
> *string*

**billingSameAsShipping**
> *boolean*

**userConfig**
> *UserConfig*

**shippingAddress**
> *Address* (virtual)

**creditCard**
> *CreditCard* (virtual)


## Event
**type**
> *number*

**customerId**
> *string*

**data**
> *Mixed*

**timestamp**
> *date*


## Notification
**type** NotificationType
> *number*

**timestamp**
> *date*

**flags**
> *number*

**data**
> *Mixed*



## Order
**timestamp**
> *date*

**product**
> *Product*

**shipping**
> *Shipping*

**trackingNumber**
> *string*

**creditCard**
> *CreditCard*

**customer**
> *Customer*

**shippingAddress**
> *Address*

**shippingCost**
> *number*

**taxCost**
> *number*

**otherCost**
> *number*

**otherDetail**
> *string*

**totalCost**
> *number*

**subscription**
> *Subscription* (optional)


## OwnedProduct
**customerId**
> *string*

**subscriptionActive**
> *bool*

**created**
> *date*

**product**
> *Product* (virtual)

**subscription**
> *Subscription* (virtual)

**nickname**
> *string*


## Product
**imageUrl**
> *string*

**productName1**
> *string*

**productName2**
> *string*

**sku**
> *string*

**unitPrice**
> *number*

**linerCode**
> *string*

**type** ProductType
> *number*

**outOfStock**
> *bool*

**shippingOptions**
> *array(Shipping)*

**shippingWithoutSubscription**
> *Shipping*

**subscriptionOptions**
> *array(SubscriptionOptions)*


## ShippingOption
**carrierMethodStr**
> *string*

**carrierMethod**
> *string*

**cost**
> *number*

**deliveryTimeStr**
> *string*


## Subscription
**created**
> *date*

**subscriptionOption**
> *SubscriptionOption*

**customerId**
> *string*

**nextShipmentDate**
> *date*

**lastShipmentDate**
> *date*

**active**
> *boolean*

**productSku**
> *string*

**ownedProductId**
> *string*


## SubscriptionOption
**billingFrequencyMonths**
> *number*

**useRecStr** the string recommendation for how often should be used
> *string* 

**intervalStr** the string that describes the frequency
> *string*

**productSku** the sku for the product this is a subscription option for a single product
> *string*

**nextShipmentDate**
> *string*


**UserConfig**
> *UserConfig*

**customerId**
> *string*

**receiveNotification**
> *NotificationType* : *boolean*






