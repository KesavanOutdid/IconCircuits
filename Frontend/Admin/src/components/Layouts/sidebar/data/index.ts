import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
                    url: "/",

        items: [
         
        ],
      },
      {
        type: "divider",
      } as any,
      {
        title: "Adminstration Panel",
        icon: Icons.User,
        items: [
          {
            title: "Manage Users",
            url: "/management/users",
          },
          {
            title: "Manage Roles",
            url: "/management/roles",
          },
        ],
      },
      {
        title: "Manage Services",
        icon: Icons.FourCircle,
        items: [
          {
            title: "List Services",
            url: "/management/services",
          }
        ],
      },
      {
        title: "Manage Orders",
        icon: Icons.Table,
        items: [
          {
            title: "List Orders",
            url: "/management/orders",
          },
         
        ],
      },
      {
        title: "Manage Quotation",
        icon: Icons.Table,
        items: [
          {
            title: "List Quotations",
            url: "/management/quotations",
          },
         
        ],
      },
      {
        title: "Manage Contact",
        icon: Icons.Calendar,
        items: [
          {
            title: "List Contacts",
            url: "/management/contacts",
          },
          
        ],
      },
      {
        title: "Manage Subscriber",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Subscribers",
            url: "/management/newsletter",
          },
         
        ],
      },
      {
        type: "divider",
      } as any,
      {
        title: "Manage Settings",
        url: "/pages/settings",
        icon: Icons.Authentication,
        items: [],
      },
    ],
  },
];
