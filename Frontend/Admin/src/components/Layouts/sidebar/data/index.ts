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
        title: "Manage Users",
        icon: Icons.User,
        url: "/management/users",
        items: [],
      },
      {
        title: "Manage Roles",
        icon: Icons.User,
        url: "/management/roles",
        items: [],
      },
      {
        title: "Manage Services",
        icon: Icons.FourCircle,
        url: "/management/services",
        items: [],
      },
      {
        title: "Manage Orders",
        icon: Icons.Table,
        url: "/management/orders",
        items: [],
      },
      {
        title: "Manage Contact",
        icon: Icons.Calendar,
        url: "/management/contacts",
        items: [],
      },
      {
        title: "Newsletter Subscriber",
        icon: Icons.Alphabet,
        url: "/management/newsletter",
        items: [],
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
