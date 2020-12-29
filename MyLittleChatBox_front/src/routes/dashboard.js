import Chat from '../components/ChatView';
import AdminChat from '../components/Admin/AdminChat';
import Home from '../components/Home';

const dashboardRoutes = [
  {
    sideView: true,
    //exact : true,
    path: '/Home',
    sidebarName: 'Home',
    navbarName: 'Home',
    icon: Home,
    component: Home
  },
  {
    sideView: true,
    //exact : true,
    path: '/Chat',
    sidebarName: 'Chat',
    navbarName: 'Chat',
    icon: Chat,
    component: Chat
  },

  {
    sideView: true,
    //exact : true,
    path: '/AdminChat',
    sidebarName: 'AdminChat',
    navbarName: 'AdminChat',
    icon: AdminChat,
    component: AdminChat
  }

  //{ redirect: true, path: "/", to: "/dashboard", navbarName: "Redirect" }
];

export default dashboardRoutes;
